import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import {
    locationAtom,
    meetingIdAtom,
  } from '../store/atom'
import { getStorage, setStorage, delStorage, setStorageStream, setStorageMeeting } from '../lib/storage'
import { newRoom, newUser, setApiToken, setRoomId } from '../lib/api'