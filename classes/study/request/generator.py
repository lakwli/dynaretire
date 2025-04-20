"""Study generation utilities for retirement plan configurations"""

from typing import Dict, List
import json
from .scenarios import TestScenarios
from .model import StudyScenarios

class StudyGenerator:
    def __init__(self):
        """Initialize study generator"""
        pass
    
    def run_study_from_json(self, study_json_path: str) -> List[str]:
        """Run a study defined in a JSON file"""
        with open(study_json_path) as f:
            study_def = json.load(f)
        return self.run_study_from_dict(study_def)
    
    def run_study_from_dict(self, study_def: Dict) -> List[str]:
        """Run a study defined in a dictionary"""
        # Initialize scenarios with base input file from study definition
        scenarios = TestScenarios(study_def['base_input_file'])
        
        # Create study from definition
        study = StudyScenarios(
            study_def['name'],
            study_def['description'],
            study_def['result_directory']
        )
        
        # Add scenarios
        for scenario in study_def['scenarios']:
            study.add_scenario(scenario)
        
        # Save study info and run study
        study.save_study_info()
        return scenarios.run_study(study)

def generate_min_spend_study() -> Dict:
    """Generate minimum spending study with all settings"""
    return {
        "name": "min_spending_analysis",
        "description": "Testing impact of different minimum spending rates",
        "base_input_file": "static/resources/files/martin.numberwalk.json",
        "result_directory": "results/min_spend_study",
        "scenarios": [
            {
                "comment": f"Testing minimum spending rate at {rate}% - Analyzing sustainability impact",
                "changes": {
                    "strategic.apply_min": True,
                    "expenses[0].min_rate": rate
                },
                "result": {
                    "prefix": f"minspend_{rate}"
                }
            }
            for rate in [70, 75, 80, 85]
        ]
    }
