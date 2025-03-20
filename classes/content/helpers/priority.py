from typing import Literal

PriorityLevel = Literal['high', 'medium', 'low', 'default']

def get_priority_level(priority: int) -> PriorityLevel:
    """
    Maps numeric priority to content priority level
    
    Args:
        priority: Numeric priority value (0-100)
        
    Returns:
        Content priority level classification
    """
    if priority >= 70:
        return 'high'
    elif priority >= 30:
        return 'medium'
    elif priority > 0:
        return 'low'
    return 'default'
