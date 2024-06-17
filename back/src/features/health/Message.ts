export interface Message {
  from: string;
  to: string;
  subject: string;
  text: string;
  [key: string]: any;
}
