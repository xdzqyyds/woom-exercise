import { useSyncExternalStore } from 'react'
import { event, Context, Data } from './whxp'
import { Stream, StreamState } from '../../lib/api'
import { WHIPClient } from 'whip-whep/whip'
import {
  deviceNone,
  deviceScreen,
  asyncGetAudioStream,
  asyncGetVideoStream,
} from '../../lib/device'