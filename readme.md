
# Clerk Webhooks Handler

A package to streamline the configuration of Clerk webhooks.

> ⚠ This project is not officially supported by Clerk. Use at your own discretion.

## Project goals

The goal of this package is to make it easier to work with Clerk webhooks by abstracting away the process of parsing the incoming event type and payload, as well as automatically validating the signature of the incoming request.

The result is a single method that uses callback functions and passes through fully-typed versions of the supported payloads, making it simpler to perform operations such as updating database records, sending custom notifications, and any other custom logic that you'd like to build.

## Installation

This package is deployed to [NPM](https://www.npmjs.com/package/@brianmmdev/clerk-webhooks-handler) and can be installed with the following command:

```bash
npm install @brianmmdev/clerk-webhooks-handler
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

- `WEBHOOK_SECRET` &emdash; The value obtained from the Clerk dashboard when registering a new endpoint.

## Usage/Examples

While this package can theoretically be used with any JavaScript web framework, it has only been tested with Next.js as of now, so this example will be using Next.js.

1. Create a route handler at your preferred location.
2. Create an instance of `createWebhooksHandler`, passing in a configuration object with a series of callback functions.
3. Export the handler's `POST` method as `POST` so Next.js will pass web requests into it.

The following example shows what this route handler would look like with the `onUserUpdated` which fires when a user is updated in Clerk, and `onSessionCreated` when a session is created.

```ts
import { createWebhooksHandler } from "@brianmmdev/clerk-webhooks-handler";

const handler = createWebhooksHandler({
  // Add/remove optional handlers to get access to the data.
  onUserUpdated: async (payload: UserJSON) => {
    // Handle the payload...
  },
  onSessionCreated: async (payload: SessionJSON) => {
    // Handle the payload...
  }
})

export const POST = handler.POST
```

The `WebhookRegistrationConfig` object defines all supported callbacks, which in turn correspond to their webhook event in Clerk:

```ts
export type WebhookRegistrationConfig = {
  secret?: string
  onUserCreated?: HandlerFn<UserJSON>;
  onUserUpdated?: HandlerFn<UserJSON>;
  onUserDeleted?: HandlerFn<DeletedObjectJSON>;
  onEmailCreated?: HandlerFn<EmailJSON>;
  onSmsCreated?: HandlerFn<SMSMessageJSON>;
  onSessionCreated?: HandlerFn<SessionJSON>;
  onSessionEnded?: HandlerFn<SessionJSON>;
  onSessionRemoved?: HandlerFn<SessionJSON>;
  onSessionRevoked?: HandlerFn<SessionJSON>;
  onOrganizationCreated?: HandlerFn<OrganizationJSON>;
  onOrganizationUpdated?: HandlerFn<OrganizationJSON>;
  onOrganizationDeleted?: HandlerFn<DeletedObjectJSON>;
  onOrganizationMembershipCreated?: HandlerFn<OrganizationMembershipJSON>;
  onOrganizationMembershipDeleted?: HandlerFn<OrganizationMembershipJSON>;
  onOrganizationMembershipUpdated?: HandlerFn<OrganizationMembershipJSON>;
  onOrganizationInvitationAccepted?: HandlerFn<OrganizationInvitationJSON>;
  onOrganizationInvitationCreated?: HandlerFn<OrganizationInvitationJSON>;
  onOrganizationInvitationRevoked?: HandlerFn<OrganizationInvitationJSON>;
}
```

In the event that a callback is not defined for the corresponding webhook, the package will respond with a `404` status to the caller.

## Contributing

Contributions are always welcome! To contribute to this project, fork it into your own GitHub account or organization, make the necessary changes, and create a pull request into this repository.

If I do not respond in a timely manner, feel free to ping or DM me on Twitter: [@brianmmdev](https://twitter.com/brianmmdev)

## Feedback

If you have any feedback, please reach out to me on Twitter: [@brianmmdev](https://twitter.com/brianmmdev)

To report issues or suggest improvements, feel free to [create an issue]().
