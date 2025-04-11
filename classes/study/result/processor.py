"""Processor for retirement plan study scenarios"""

import json
import os
from typing import Dict, List
from datetime import datetime
from classes.web.json import input_json as ij
from classes.web.json import json_data as j
from core import plan as pl
from .output import StudyOutput
from classes.logging_config import initialize_logger

logger = initialize_logger()

class StudyProcessor:
    """Process study scenarios through retirement plan calculator"""
    
    def process_scenarios(self, input_dir: str, output_dir: str) -> List[str]:
        """
        Process all JSON files in input directory
        
        Args:
            input_dir: Directory containing scenario JSON files
            output_dir: Directory to save result files
            
        Returns:
            List of result file paths
        """
        logger.info(f"Starting to process scenarios from {input_dir}")
        os.makedirs(output_dir, exist_ok=True)
        result_files = []
        
        # List files before processing
        logger.info("Files in directory:")
        for file in os.listdir(input_dir):
            logger.info(f"- {file}")
            if file.endswith('.json') and not file.endswith('_study_info.json'):
                input_path = os.path.join(input_dir, file)
                try:
                    # Try to read file first to validate JSON
                    with open(input_path, 'r') as f:
                        try:
                            json.load(f)
                            logger.info(f"Valid JSON file: {file}")
                        except json.JSONDecodeError as e:
                            logger.error(f"Invalid JSON in {file}: {str(e)}")
                            continue

                    logger.info(f"Processing scenario: {file}")
                    results = self.process_single_scenario(input_path)
                    
                    # Save with _res suffix
                    output_name = os.path.splitext(file)[0] + '_res.json'
                    output_path = os.path.join(output_dir, output_name)
                    
                    with open(output_path, 'w') as f:
                        json.dump(results, f, indent=2)
                    
                    result_files.append(output_path)
                    logger.info(f"Successfully processed scenario: {file}")
                    
                except Exception as e:
                    logger.error(f"Error processing {file}: {str(e)}", exc_info=True)
        
        logger.info(f"Completed processing. Generated {len(result_files)} result files")
        return result_files
    
    def process_single_scenario(self, scenario_file: str) -> Dict:
        """
        Process a single scenario through pl.Plan
        
        Args:
            scenario_file: Path to scenario JSON file
            
        Returns:
            Dictionary containing yearly results
        """
        logger.info(f"Processing individual scenario: {scenario_file}")
        
        try:
            # Load and parse scenario
            with open(scenario_file) as f:
                # Read file content for logging
                content = f.read()
                logger.debug(f"File content:\n{content}")
                
                # Parse into Plan_Data object
                plan_data = j.Plan_Data.from_json(content)
            
            # Setup plan configuration
            i = ij.InputJson(plan_data)
            i.process()
            
            # Create study output handler
            study_output = StudyOutput(i.isPaymentAtBegin, i.expenses, i.funds, i.incomes)
            
            # Create and run plan
            p = pl.Plan(i.isPaymentAtBegin, i.current_age, 
                       i.current_calendar_year, i.expenses, i.funds, 
                       i.incomes, study_output)
            p.set_strategic(i.strategic)
            year, lack_fund = p.execute_plan()
            
            logger.info("Plan execution completed")
            
            # Return results with metadata
            return {
                "scenario_id": os.path.splitext(os.path.basename(scenario_file))[0],
                "execution_timestamp": datetime.now().isoformat(),
                "terminal_year": year,
                "funds_depleted": lack_fund,
                "yearly_results": study_output.get_results()
            }
        except Exception as e:
            logger.error(f"Error in process_single_scenario: {str(e)}", exc_info=True)
            raise
