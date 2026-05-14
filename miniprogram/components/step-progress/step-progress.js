Component({
  properties: {
    steps: { type: Array, value: [] },
    currentStep: { type: Number, value: 1 },
  },

  data: {
    totalSteps: 0,
  },

  observers: {
    steps(steps) {
      this.setData({ totalSteps: steps.length });
    },
  },
});
