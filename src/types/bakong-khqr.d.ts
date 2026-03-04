declare module 'bakong-khqr' {
  export const khqrData: any;
  export class IndividualInfo {
    constructor(accountId: string, merchantName: string, merchantCity: string, optionalData?: any);
  }
  export class BakongKHQR {
    generateIndividual(info: any): any;
  }
}
