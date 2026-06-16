/**
 * Credentials interface representing user authentication details
 */
export interface Credentials {
  username: string;
  password: string;
}

export type Username = Pick<Credentials, "username">;

export type Password = Pick<Credentials, "password">;
