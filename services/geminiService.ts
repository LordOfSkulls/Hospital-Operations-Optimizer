import { GoogleGenAI, Type } from "@google/genai";
import { PREDICTION_TYPES } from "../constants";
// Helper to check mock mode
const isMockMode = () => {
  return process.env.MOCK_MODE === "true" || !process.env.GEMINI_API_KEY && !process.env.API_KEY;
};
import type { PredictionType, PredictionInput, PredictionOutput, ManualPredictionInput, FilePredictionInput, HospitalProfile } from "../types";
import { PREDICTION_TYPES } from "../constants";

const getPredictionValueSchema = (predictionType: PredictionType) => {
  switch (predictionType) {
    case PREDICTION_TYPES.BED_OCCUPANCY:
      return {
        type: Type.OBJECT,
        properties: {
          predictedOccupancy: {
            type: Type.NUMBER,
            description: "Predicted hospital-wide bed occupancy percentage. This should be a number between 0 and 100.",
          },
        },
        required: ['predictedOccupancy']
      };
    case PREDICTION_TYPES.WAITING_TIME:
      return {
        type: Type.OBJECT,
        properties: {
          predictedWaitTimeHours: {
            type: Type.NUMBER,
            description: "Predicted average Emergency Room waiting time in hours. This can be a decimal value.",
          },
        },
        required: ['predictedWaitTimeHours']
      };
    case PREDICTION_TYPES.ER_LOAD:
      return {
        type: Type.OBJECT,
        properties: {
          predictedLoad: {
            type: Type.ARRAY,
            description: "An array representing the predicted number of patients in the ER for the next 6 hours.",
            items: {
              type: Type.OBJECT,
              properties: {
                hour: {
                  type: Type.STRING,
                  description: "The specific hour for the prediction (e.g., '5 PM', '6 PM').",
                },
                patients: {
                  type: Type.NUMBER,
                  description: "The predicted number of patients during that hour.",
                },
              },
              required: ['hour', 'patients']
            },
          },
        },
        required: ['predictedLoad']
      };
    default:
      return { type: Type.OBJECT, properties: {} };
  }
};

const getResponseSchema = (predictionTypes: PredictionType[]) => {
  const predictionProperties: { [key: string]: any } = {};
  predictionTypes.forEach(type => {
    predictionProperties[type] = getPredictionValueSchema(type);
  });

  return {
    type: Type.OBJECT,
    properties: {
      predictions: {
        type: Type.OBJECT,
        properties: predictionProperties,
        description: "An object containing the predictions for each requested metric. Keys are the metric names. This entire object can be null if no predictions can be made.",
        nullable: true,
      },
      explanation: {
        type: Type.STRING,
        description: "A short, natural-language explanation of the predictions, including the key factors that influenced the results. If a prediction couldn't be made, explain why."
      },
      warnings: {
        type: Type.ARRAY,
        description: "A list of warnings if the provided data is insufficient, inconsistent, or has quality issues.",
        items: { type: Type.STRING }
      },
      recommendations: {
        type: Type.ARRAY,
        description: "A list of 3-4 concise, actionable operational recommendations based on the predictions. If no predictions, this can be empty.",
        items: { type: Type.STRING }
      }
    },
    required: ['predictions', 'explanation', 'warnings', 'recommendations']
  };
};

const generateTasksList = (predictionTypes: PredictionType[]): string => {
    return predictionTypes.map(type => {
        switch (type) {
            case PREDICTION_TYPES.BED_OCCUPANCY:
              return '- Predict the hospital-wide bed occupancy percentage for the next 24 hours.';
            case PREDICTION_TYPES.WAITING_TIME:
              return '- Predict the average ER waiting time in hours for the next 4 hours.';
            case PREDICTION_TYPES.ER_LOAD:
              return '- Predict the patient load in the Emergency Room for each of the next 6 hours.';
            default:
              return '';
        }
    }).join('\n');
};


const generateManualPrompt = (predictionTypes: PredictionType[], input: ManualPredictionInput, userProfile: HospitalProfile | null): string => {
    if (!userProfile) {
      throw new Error("User profile is required to calculate bed occupancy.");
    }

    const totalBeds = userProfile.totalBeds;
    const occupiedBeds = input.occupiedBeds;
    const occupancyPercentage = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
    
    const commonData = `
      - Current hospital-wide bed occupancy: ${occupancyPercentage.toFixed(1)}% (Calculated from ${input.occupiedBeds} occupied beds out of ${totalBeds} total)
      - Number of scheduled surgeries today: ${input.scheduledSurgeries}
      - Average patient discharge rate per day: ${input.avgDischargeRate}
      - Current ER arrivals per hour: ${input.erArrivalsPerHour}
      - Time of day: ${input.timeOfDay}
      - Day of week: ${input.dayOfWeek}
    `;
    
    const tasks = generateTasksList(predictionTypes);
  
    return `
      You are an expert AI assistant specializing in hospital operations management. 
      Analyze the following real-time hospital data to predict the requested metrics.
  
      **Current Hospital Data:**
      ${commonData}
  
      **Tasks:**
      ${tasks}
  
      Return your full analysis in the required JSON format. The predictions must be realistic and derived from the provided data. 
      The explanation should summarize your findings for all requested metrics. Provide practical recommendations to manage the situation. 
      Since this is manually entered data, warnings can be minimal unless the values seem contradictory.
    `;
};

const generateFilePrompt = (predictionTypes: PredictionType[], input: FilePredictionInput): string => {
    const tasks = generateTasksList(predictionTypes);

    return `
    You are an AI data analyst for a Hospital Operations Optimization web app. A user has uploaded a file with hospital operational data.

    **File Name:** ${input.fileName}
    
    **Primary Tasks:**
    ${tasks}

    Your job is to:
    1.  **Parse and Validate:** Analyze the provided dataset content. Identify which columns are relevant for predicting the requested metrics. Relevant features could include bed occupancy, length of stay, arrival rates, discharges, ER visits, staffing, timestamps, etc.
    2.  **Model and Predict:** Use the data to generate the requested forecasts.
    3.  **Return JSON:** Respond with a valid JSON object containing your complete analysis.

    **JSON Output Requirements:**
    - **predictions:** An object containing prediction values for each requested metric. The keys of this object must be the full metric name (e.g., "Bed Occupancy"). If the data is insufficient to model a metric, omit its key from the object. If no metrics can be predicted, this entire \`predictions\` object MUST be \`null\`.
    - **explanation:** A short, natural-language explanation of your findings and the predictions.
    - **warnings:** A list of flags or warnings if the data is insufficient, inconsistent, or has quality issues (e.g., missing values, strange outliers).
    - **recommendations:** A list of 3-4 actionable operational recommendations based on your predictions.

    **File Content:**
    \`\`\`
    ${input.fileContent}
    \`\`\`
    `;
};


export const getHospitalPrediction = async (predictionTypes: PredictionType[], input: PredictionInput, userProfile: HospitalProfile | null): Promise<PredictionOutput> => {
  if (isMockMode()) {
    // Return mock predictions
    const mock: PredictionOutput = {
      predictions: {},
      explanation: "This is a mock prediction. No real AI call was made.",
      warnings: [],
      recommendations: [
        "Review staffing levels for peak hours.",
        "Monitor ER arrivals and adjust resources.",
        "Optimize discharge process to free up beds.",
        "Schedule elective surgeries during low occupancy."
      ]
    };
    predictionTypes.forEach(type => {
      switch (type) {
        case PREDICTION_TYPES.BED_OCCUPANCY:
          mock.predictions![type] = { predictedOccupancy: 78.5 };
          break;
        case PREDICTION_TYPES.WAITING_TIME:
          mock.predictions![type] = { predictedWaitTimeHours: 1.2 };
          break;
        case PREDICTION_TYPES.ER_LOAD:
          mock.predictions![type] = {
            predictedLoad: Array.from({ length: 6 }, (_, i) => ({
              hour: `${8 + i} PM`,
              patients: Math.floor(10 + Math.random() * 8)
            }))
          };
          break;
        default:
          break;
      }
    });
    return mock;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured. Please set GEMINI_API_KEY (recommended) or API_KEY environment variable.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = input.dataType === 'manual'
    ? generateManualPrompt(predictionTypes, input, userProfile)
    : generateFilePrompt(predictionTypes, input as FilePredictionInput);
    
  const schema = getResponseSchema(predictionTypes);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as PredictionOutput;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid prediction from the AI. The model may have returned an unexpected format.");
  }
};

// --- Onboarding Service ---

const getOnboardingProfileSchema = () => ({
  type: Type.OBJECT,
  properties: {
    totalBeds: { 
      type: Type.NUMBER, 
      description: "The total number of inpatient beds in the hospital. Find a specific number, or make a reasonable estimate if not explicitly stated."
    },
    totalErRooms: { 
      type: Type.NUMBER, 
      description: "The total number of rooms or bays in the Emergency Room/Department."
    },
    totalStaff: {
      type: Type.NUMBER,
      description: "The average number of clinical staff on duty at any given time. If staff numbers are listed by role, sum them up."
    },
    avgPatientsPerDoctor: {
      type: Type.NUMBER,
      description: "The average number of patients a single doctor can process per hour. This may need to be calculated or estimated if not directly available. Can be null if not found.",
      nullable: true
    },
  },
  required: ['totalBeds', 'totalErRooms', 'totalStaff']
});


const generateOnboardingPrompt = (fileContent: string) => {
  return `
    You are an AI data analyst tasked with setting up a new hospital profile.
    A user has uploaded a CSV or text file containing descriptive data about their hospital's capacity and operations.
    Your job is to read the file content and extract the specific baseline operational metrics required for the profile.

    **Tasks:**
    1.  **Analyze the Data:** Read through the provided file content.
    2.  **Extract Key Metrics:** Identify values for the following metrics:
        - Total number of hospital beds.
        - Total number of Emergency Room (ER) rooms.
        - Average total staff on duty.
        - Average number of patients a doctor can process per hour (if available).
    3.  **Return JSON:** Respond with a valid JSON object containing the extracted values. If a value isn't explicitly mentioned, make a reasonable estimate based on the other information, but prioritize explicitly stated numbers. The 'avgPatientsPerDoctor' can be null if it's impossible to determine.

    **File Content:**
    \`\`\`
    ${fileContent}
    \`\`\`
  `;
};

export const getProfileFromData = async (fileContent: string): Promise<Omit<HospitalProfile, 'hospitalId'>> => {
  if (isMockMode()) {
    // Return mock onboarding profile
    return {
      totalBeds: 500,
      totalErRooms: 20,
      totalStaff: 450,
      avgPatientsPerDoctor: 2.5
    };
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured. Please set GEMINI_API_KEY (recommended) or API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const schema = getOnboardingProfileSchema();
  const prompt = generateOnboardingPrompt(fileContent);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Omit<HospitalProfile, 'hospitalId'>;
  } catch (error) {
    console.error("Onboarding data extraction failed:", error);
    throw new Error("Failed to extract hospital profile data from the uploaded file.");
  }
};