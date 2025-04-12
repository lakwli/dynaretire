"""Tests for study result processing functionality"""

from classes.study.result.processor import StudyProcessor
import json
import os
from classes.logging_config import initialize_logger

logger = initialize_logger()

def test_process_scenarios():
    """Test processing of study scenarios"""
    
    # Initialize processor
    processor = StudyProcessor()
    
    print("\nProcessing pause strategy scenarios:")
    print("-----------------------------------")
    pause_results = processor.process_scenarios(
        input_dir="results/pause_strategies",
        output_dir="results/pause_strategies_processed"
    )
    
    # Check direct file access since json loads is failing
    if os.path.exists("results/pause_strategies/custom_pause_20250411_123218.json"):
        try:
            with open("results/pause_strategies/custom_pause_20250411_123218.json") as f:
                test_data = json.load(f)
                print("Test file loaded successfully")
        except json.JSONDecodeError as e:
            print(f"Error loading test file: {str(e)}")
    
    print(f"Processed {len(pause_results)} pause strategy scenarios")
    
    print("\nProcessing min spend scenarios:")
    print("------------------------------")
    spend_results = processor.process_scenarios(
        input_dir="results/min_spend_study",
        output_dir="results/min_spend_study_processed"
    )
    print(f"Processed {len(spend_results)} min spend scenarios")
    
    # Verify results
    def verify_results(results, scenario_type):
        print(f"\nVerifying {scenario_type} results:")
        print("-" * (len(scenario_type) + 19))
        for result_file in results:
            try:
                with open(result_file) as f:
                    result = json.load(f)
                    print(f"\nScenario: {result['scenario_id']}")
                    print(f"Terminal year: {result['terminal_year']}")
                    print(f"Funds depleted: {result['funds_depleted']}")
                    print(f"Years processed: {len(result['yearly_results'])}")
            except Exception as e:
                logger.error(f"Error verifying {result_file}: {str(e)}")
    
    if pause_results:
        verify_results(pause_results, "pause strategy")
    if spend_results:
        verify_results(spend_results, "min spend")
            
if __name__ == "__main__":
    test_process_scenarios()
