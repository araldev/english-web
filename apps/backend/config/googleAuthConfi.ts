export const {
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET_KEY,
  GOOGLE_REDIRECT_URI
} = process.env

export interface IStoreGoogle {
  authorizeUrl: string | null
}

export const storeGoogle: IStoreGoogle = {
  authorizeUrl: null
}