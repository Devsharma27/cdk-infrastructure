import { IEventBridgeBinding } from "@exporo/specifications-events/dist/interfaces/configs";
import { PublisherEvent, SubscriberEvent } from "@exporo/specifications-events/dist/parser/shared/event_connectors";

export interface IPublisherSpecifications {
    sources: string[];
    serverBindings: IEventBridgeBinding[];
    events: PublisherEvent<any, any>[];
}
export interface ISubscriberSpecifications {
    sources: string[];
    serverBindings: IEventBridgeBinding[];
    events: SubscriberEvent<any, any>[];
}
export interface ISpecifications {
    sources: string[];
    publishers: IPublisherSpecifications;
    subscribers: ISubscriberSpecifications;
}

export interface IEventBridgeConnectorStackInput {
    Specifications: ISpecifications;
}
