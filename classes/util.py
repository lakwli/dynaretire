class BidirectionalCounter:
    def __init__(self, start=0):
        self.value = start

    def next(self):
        self.value += 1
        return self.value

    def prev(self):
        self.value -= 1
        return self.value