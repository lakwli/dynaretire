"""Test scenario handling for retirement studies"""
from typing import Dict, Any, List
from datetime import datetime
import os
import json
from copy import deepcopy
from classes.logging_config import initialize_logger

logger = initialize_logger()

class TestScenarios:
    def __init__(self, base_json_path: str):
        """Initialize with base JSON file path"""
        self.base_json_path = base_json_path
        
    def _apply_changes(self, base_json: Dict[str, Any], changes: Dict[str, Any]) -> Dict[str, Any]:
        """Apply changes to base JSON"""
        # Deep copy to ensure nested structures are properly copied
        modified_json = deepcopy(base_json)
        
        try:
            # First verify we can serialize the input
            json.dumps(modified_json, indent=2)
        except Exception as e:
            logger.error(f"Base JSON is not valid: {str(e)}")
            raise
            
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

        try:
            # Verify the modified JSON is still valid
            json.dumps(modified_json, indent=2)
        except Exception as e:
            logger.error(f"Modified JSON is not valid after changes: {str(e)}")
            raise
            
        return modified_json

    def _load_json_with_validation(self, file_path: str) -> Dict:
        """Load and validate JSON file"""
        try:
            with open(file_path) as f:
                content = f.read()
                # Parse and reformat with consistent indentation
                data = json.loads(content)
                return data
        except Exception as e:
            logger.error(f"Error loading/validating JSON from {file_path}: {str(e)}")
            raise

    def run_study(self, study) -> List[str]:
        """Run all scenarios in a study"""
        results = []
        
        # Load and validate base JSON
        logger.info(f"Loading base JSON from {self.base_json_path}")
        base_json = self._load_json_with_validation(self.base_json_path)
        
        # Run each scenario
        for scenario in study.get_scenarios():
            try:
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
                
                try:
                    # Write with proper indentation
                    with open(result_file, 'w') as f:
                        json.dump(modified_json, f, indent=2)
                    logger.info(f"Successfully wrote scenario to {result_file}")
                    
                except Exception as e:
                    logger.error(f"Error saving JSON for {prefix}: {str(e)}")
                    raise
                    
                results.append(result_file)
                
            except Exception as e:
                logger.error(f"Error processing scenario {scenario.get('result', {}).get('prefix', 'unknown')}: {str(e)}")
                raise
            
        return results
