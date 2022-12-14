export enum ResourceDescriptionsEnum {
    SUBSCRIPTION_API_GATEWAY = "Subscription API Gateway",
    CENTRAL_EVENT_BRIDGE_PUBLISHING = "this simple rule takes all public event of our AppDomain and distribute it to the central account",
    ALLOW_SENDING_EVENTS_TO_CENTRAL_STORE = "allow to push events to an event bridge in another aws account",
    PUBLIC_EVENT_BRIDGE_SUBSCRIBER_LOGGING = "all incoming events to the subscriber eb are logged",
    APPLICATION_ROLE = "a role for the whole application: ",
}
