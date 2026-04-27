import { type ImmutableObject } from 'jimu-core'

export interface Config {
  statusField?: string
}

export type IMConfig = ImmutableObject<Config>
