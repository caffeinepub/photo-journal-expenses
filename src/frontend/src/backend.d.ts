import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Entry {
    id: string;
    date: bigint;
    note: string;
    photo: ExternalBlob;
}
export interface backendInterface {
    addEntry(id: string, date: bigint, note: string, photo: ExternalBlob): Promise<void>;
    deleteEntry(id: string): Promise<void>;
    getEntry(id: string): Promise<Entry>;
    listEntries(): Promise<Array<Entry>>;
}
