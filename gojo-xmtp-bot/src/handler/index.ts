interface Convo {
  role: string;
  message: string;
}

export default function handler(context: Convo[], input: string) {
  return input;
}
