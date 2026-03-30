export type Events = {
  "analysis/upload.completed": {
    data: {
      analysisId: string;
      userId: string;
      inputUrl: string;
      inputType: string;
    };
  };
};
