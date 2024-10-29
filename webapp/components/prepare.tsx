import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import useWhipClient from "./use/whip"
import DeviceBar from './device'
import Loading from "./svg/loading"
import Player from './player/player'
import {
  meetingJoinedAtom,
} from '../store/atom'
import { getStorageName, setStorageName, getStorageStream } from '../lib/storage'
import { setStream } from '../lib/api'