# Clerk Webhooks Handler

A package to streamline the configuration of Clerk webhooks in a Next.js application.

TODO: complete the readme 🤗

## Getting started

Install the package:

```
npm install @brianmmdev/clerk-webhooks-handler
```

Create a route handler at your preferred location with the following code. Modify the events events inside the configuration passed into `createWehbooksHandler` to handle the various events sent from Clerk.

```ts
import { createWebhooksHandler } from "@brianmmdev/clerk-webhooks-handler";

const handler = createWebhooksHandler({
  // Add/remove optional handlers to get access to the data.
  onUserUpdated: async (payload) => {
    // Update a user in the database
    console.log("user updated!", payload)
  },
  onSessionCreated: async (payload) => {
    // Create a session in the database
    console.log("session created!", payload)
  }
})

export const POST = handler.POST
```

Watch this demo to learn more about how to use the package:

Please also ping me on Twitter with feedback: https://twitter.com/brianmmdev