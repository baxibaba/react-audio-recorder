import { useState, useRef } from 'react'
import { RECORD_STATUS } from './status'
import useTimer from './useTimer'

type record_status_type =
  | RECORD_STATUS.RECORDING
  | RECORD_STATUS.PAUSED
  | RECORD_STATUS.IDLE

let mediaRecorder: MediaRecorder
let localStream: MediaStream

export const useAudioRecorder = () => {
  const dataArray = useRef<Array<Blob>>([])

  const [status, setStatus] = useState<record_status_type>(RECORD_STATUS.IDLE)
  const [audioResult, setAudioResult] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    timer,
    handleStartTimer,
    handlePauseTimer,
    handleResumeTimer,
    handleResetTimer
  } = useTimer()

  const startRecording = () => {
    if (status === RECORD_STATUS.IDLE) {
      try {
        setErrorMessage('')
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((mediaStreamObj: MediaStream) => {
            localStream = mediaStreamObj
            mediaRecorder = new MediaRecorder(mediaStreamObj)
            mediaRecorder.start()
            mediaRecorder.onstart = () => {
              handleStartTimer()
              setStatus(RECORD_STATUS.RECORDING)
            }
            mediaRecorder.ondataavailable = (event: BlobEvent) => {
              dataArray.current.push(event.data)
            }
          })
          .catch((error) => {
            setErrorMessage(error?.message)
          })
      } catch (error) {
        setErrorMessage(error?.message)
      }
    } else {
    }
  }

  const resumeRecording = () => {
    if (status === RECORD_STATUS.PAUSED) {
      mediaRecorder.resume()
      mediaRecorder.onresume = () => {
        handleResumeTimer()
        setStatus(RECORD_STATUS.RECORDING)
      }
    } else {
    }
  }

  const pauseRecording = () => {
    if (status === RECORD_STATUS.RECORDING) {
      mediaRecorder.pause()
      mediaRecorder.onpause = () => {
        handlePauseTimer()
        setStatus(RECORD_STATUS.PAUSED)
      }
    } else {
    }
  }

  const stopRecording = () => {
    if (status !== RECORD_STATUS.IDLE) {
      mediaRecorder.stop()
      mediaRecorder.onstop = () => {
        handleResetTimer()
        const audioData = new Blob(dataArray.current, { type: 'audio/mpeg' })
        dataArray.current = []
        setAudioResult(window.URL.createObjectURL(audioData))
        setStatus(RECORD_STATUS.IDLE)
        localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
          track.stop()
        })
      }
    } else {
    }
  }

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    status,
    audioResult,
    errorMessage,
    timer
  }
}
