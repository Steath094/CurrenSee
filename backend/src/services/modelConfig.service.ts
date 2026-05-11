import { ModelConfig } from "../models/modelConfig.model";

export type ModelSummary = {
    description: string;
    name: string;
    version: string;
};

export type ActivePredictionModelConfig = ModelSummary & {
    endpoint: string;
};

type ModelSummaryRecord = ModelSummary & {
    createdAt?: Date | string;
    isDefault?: boolean;
};

type ModelConfigRecord = ActivePredictionModelConfig;

const stableModelNamePattern = /\b(stable|default)\b/i;

function getModelPriority(model: ModelSummaryRecord) {
    if (model.isDefault) {
        return 0;
    }

    return stableModelNamePattern.test(model.name) ? 1 : 2;
}

function compareModels(a: ModelSummaryRecord, b: ModelSummaryRecord) {
    const priorityDifference = getModelPriority(a) - getModelPriority(b);

    if (priorityDifference !== 0) {
        return priorityDifference;
    }

    const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    if (createdAtA !== createdAtB) {
        return createdAtA - createdAtB;
    }

    return a.version.localeCompare(b.version, undefined, {
        numeric: true,
        sensitivity: "base",
    });
}

export async function getActiveModelSummaries(): Promise<ModelSummary[]> {
    const models = (await ModelConfig.find({ isActive: true })
        .select({
            _id: 0,
            createdAt: 1,
            description: 1,
            isDefault: 1,
            name: 1,
            version: 1,
        })
        .lean()) as ModelSummaryRecord[];

    return models.sort(compareModels).map((model) => ({
        description: model.description || "",
        name: model.name,
        version: model.version,
    }));
}

export async function getActiveModelConfigByVersion(
    version: string,
): Promise<ActivePredictionModelConfig | null> {
    const model = (await ModelConfig.findOne({
        isActive: true,
        version,
    })
        .select({
            _id: 0,
            description: 1,
            endpoint: 1,
            name: 1,
            version: 1,
        })
        .lean()) as ActivePredictionModelConfig | null;

    if (!model) {
        return null;
    }

    return {
        description: model.description || "",
        endpoint: model.endpoint,
        name: model.name,
        version: model.version,
    };
}
