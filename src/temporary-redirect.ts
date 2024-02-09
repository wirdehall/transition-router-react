export const TemporaryRedirectName = "Temporary Redirect";

export class TemporaryRedirect extends Error {
  private isTrustedError = true;
  protected errorNumber = 307;
  protected newLocation: string;

  constructor(newLocation: string) {
    super("307 - Temporary Redirect");
    this.name = TemporaryRedirectName;
    this.newLocation = newLocation;
  }

  public getIsTrustedError = () => this.isTrustedError;
  public getErrorNumber = () => this.errorNumber;
  public getNewLocation = () => this.newLocation;
}
