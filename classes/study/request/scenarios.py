"""Test scenario handling for retirement studies"""
from typing import Dict, Any, List
from datetime import datetime
import os
import json

class TestScenarios:
    def __init__(self, base_json_path: str):
        """Initialize with base JSON file path"""
        self.base_json_path = base_json_path
        
    def _apply_changes(self, base_json: Dict[str, Any], changes: Dict[str, Any]) -> Dict[str, Any]:
        """Apply changes to base JSON"""
        modified_json = base_json.copy()
        for key, value in changes.items():
            if '.' in key:
                parts = key.split('.')
                target = modified_json
                for part in parts[:-1]:
                    if '[' in part:
                        name, idx = part.split('[')
                        idx = int(idx.strip(']'))
                        if name not in target:
                            target[name] = []
                        while len(target[name]) <= idx:
                            target[name].append({})
                        target = target[name][idx]
                    else:
                        if part not in target:
                            target[part] = {}
                        target = target[part]
                last_part = parts[-1]
                if '[' in last_part:
                    name, idx = last_part.split('[')
                    idx = int(idx.strip(']'))
                    if name not in target:
                        target[name] = []
                    while len(target[name]) <= idx:
                        target[name].append({})
                    target[name][idx] = value
                else:
                    target[last_part] = value
            else:
                modified_json[key] = value
        return modified_json

    def run_study(self, study) -> List[str]:
        """Run all scenarios in a study"""
        results = []
        
        # Load base JSON
        with open(self.base_json_path) as f:
            base_json = json.load(f)
        
        # Run each scenario
        for scenario in study.get_scenarios():
            # Apply changes
            modified_json = self._apply_changes(base_json, scenario['changes'])
            
            # Add technical section
            modified_json['technical'] = {
                'comment': scenario.get('comment', 'No comment provided'),
                'changes': scenario['changes'],
                'result': scenario['result'],
                'study': scenario.get('study', {}),
                'execution_timestamp': datetime.now().isoformat()
            }
            
            # Save modified JSON
            path = scenario['result']['path']
            prefix = scenario['result']['prefix']
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            os.makedirs(path, exist_ok=True)
            
            result_file = os.path.join(path, f"{prefix}_{timestamp}.json")
            with open(result_file, 'w') as f:
                json.dump(modified_json, f, indent=2)
            
            results.append(result_file)
        
        return results
