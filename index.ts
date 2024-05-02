import { EmailJSON, SMSMessageJSON, WebhookEvent, DeletedObjectJSON, OrganizationJSON, UserJSON, SessionJSON, OrganizationMembershipJSON, OrganizationInvitationJSON } from "@clerk/backend";
import { Webhook } from "svix"

export function createWebhooksHandler(config: WebhookRegistrationConfig): WebhooksHandler {
  return {
    config: config,
    POST: async (req: Request) => await handleWebhooks(config, req)
  }
}

type WebhooksHandler = {
  config: WebhookRegistrationConfig
  POST: (req: Request) => Promise<Response>
}

type HandlerType = UserJSON | OrganizationJSON | DeletedObjectJSON | SMSMessageJSON | SessionJSON | OrganizationMembershipJSON | OrganizationInvitationJSON | EmailJSON
type HandlerFn<T extends HandlerType> = (payload: T) => Promise<void | Response>

type WebhooksHandlerMap = {
  [path: string]: HandlerFn<UserJSON> |
    HandlerFn<OrganizationJSON> |
    HandlerFn<DeletedObjectJSON> |
    HandlerFn<SMSMessageJSON> |
    HandlerFn<SessionJSON> |
    HandlerFn<OrganizationMembershipJSON> |
    HandlerFn<OrganizationInvitationJSON> |
    HandlerFn<EmailJSON> |
    undefined
}

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

export async function handleWebhooks(config: WebhookRegistrationConfig, req: Request): Promise<Response> {
  // If the request is not a POST request or does not start with the webhook URL, return a 404
  const WEBHOOK_SECRET = config.secret ? config.secret : process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  const handlerMap: WebhooksHandlerMap = {
    'user.created': config.onUserCreated,
    'user.updated': config.onUserUpdated,
    'user.deleted': config.onUserDeleted,
    'email.created': config.onEmailCreated,
    'sms.created': config.onSmsCreated,
    'session.created': config.onSessionCreated,
    'session.ended': config.onSessionEnded,
    'session.removed': config.onSessionRemoved,
    'session.revoked': config.onSessionRevoked,
    'organization.created': config.onOrganizationCreated,
    'organization.updated': config.onOrganizationUpdated,
    'organization.deleted': config.onOrganizationDeleted,
    'organizationMembership.created': config.onOrganizationMembershipCreated,
    'organizationMembership.deleted': config.onOrganizationMembershipDeleted,
    'organizationMembership.updated': config.onOrganizationMembershipUpdated,
    'organizationInvitation.accepted': config.onOrganizationInvitationAccepted,
    'organizationInvitation.created': config.onOrganizationInvitationCreated,
    'organizationInvitation.revoked': config.onOrganizationInvitationRevoked
  }

  if(handlerMap[evt.type]) {
    return await _handler(evt, handlerMap[evt.type] as HandlerFn<HandlerType>)
  }

  // If we don't have a handler for the event, return a 404
  return new Response('', { status: 404 })
}

async function _handler(event: WebhookEvent, callback: Function): Promise<Response> {
  let response = await callback(event.data)
  if(response != undefined) {
    return response
  } else {
    return new Response('', { status: 200 })
  }
}