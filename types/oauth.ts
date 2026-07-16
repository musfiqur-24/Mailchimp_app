export interface OAuthState {
  portalId: string;
}

export interface MailchimpConnection {
  accessToken: string;
  dataCenter: string;
  connectedAt: string;
}

export interface StoredPortalConnection {
  mailchimpAccessToken?: string;
  mailchimpServer?: string;
  connected?: boolean;
  connectedAt?: string;
  hubspotAccessToken?: string;
  hubspotRefreshToken?: string;
  hubspotAccessTokenExpiresAt?: string;
}
