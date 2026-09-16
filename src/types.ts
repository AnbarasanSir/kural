export interface TTSResponse {
  audioBlob?: Blob;
  error?: string;
}

export type VoiceType = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface TTSRequest {
  text: string;
  voice: VoiceType;
}
