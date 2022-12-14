import {StagesEnum} from "@exporo/specifications-events/dist/enums/stages";
import {ErrorsEnum} from "../enums/errors";

export declare const ORGANISATION_ID = "o-taas5qaikp";

export function getOrganisationId(): string {
    return process.env.ORGANISATION_ID || ORGANISATION_ID;
}


export function getCentralStoreAccountId(): string {
    const centralEventAccountId = process.env.AWS_SSM_CENTRAL_EVENT_ACCOUNT_ID || "432056661658";
    if (!centralEventAccountId) {
        throw new Error("There is no environmnet where AWS_SSM_CENTRAL_EVENT_ACCOUNT_ID is defined");
    }
    return centralEventAccountId;
}

export function getStage(): StagesEnum {
    const _stage =  process.env.AWS_SSM_STAGE as StagesEnum || "dev" ;
    if(Object.values(StagesEnum).includes(_stage)){
        return _stage;
    }else{
        throw new Error(ErrorsEnum.STAGE_IS_UNDEFINED);
    }
}
