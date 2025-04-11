"""Study model and builder classes for retirement plan configurations"""

from typing import Dict, List, Optional
from datetime import datetime
import os
import json

class StudyScenarios:
    def __init__(self, study_name: str, description: str, result_directory: str):
        """
        Initialize a study of related scenarios
        
        Args:
            study_name: Name of the study
            description: Description of what this study is investigating
            result_directory: Directory for results (used exactly as specified)
        """
        self.study_name = study_name
        self.description = description
        self.result_directory = result_directory
        self.scenarios = []
        
    def add_scenario(self, scenario: Dict) -> None:
        """Add a scenario to this study"""
        # Set scenario path to exact directory specified
        if 'result' not in scenario:
            scenario['result'] = {}
        scenario['result']['path'] = self.result_directory
        
        # Add study metadata
        scenario['study'] = {
            'name': self.study_name,
            'description': self.description,
            'scenario_index': len(self.scenarios) + 1
        }
        
        self.scenarios.append(scenario)

    def get_scenarios(self) -> List[Dict]:
        """Get all scenarios in this study"""
        return self.scenarios

    def save_study_info(self) -> str:
        """Save study metadata to a file"""
        os.makedirs(self.result_directory, exist_ok=True)
        
        study_info = {
            'name': self.study_name,
            'description': self.description,
            'created_at': datetime.now().isoformat(),
            'scenario_count': len(self.scenarios),
            'scenarios': [
                {
                    'comment': s.get('comment', 'No description'),
                    'prefix': s.get('result', {}).get('prefix', 'unnamed'),
                    'study_metadata': s.get('study', {})
                }
                for s in self.scenarios
            ]
        }
        
        study_file = os.path.join(self.result_directory, '_study_info.json')
        with open(study_file, 'w') as f:
            json.dump(study_info, f, indent=2)
            
        return study_file
