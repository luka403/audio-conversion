import ffmpeg from 'fluent-ffmpeg';
import { Socket } from 'socket.io';
import { audioHandler, stopTranscriptionHandler } from './audio-handler';

const audioConversion = (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('audio', (data: Buffer) => {
    try {
      // Convert WebM audio to PCM WAV format
      const convertedAudio = await new Promise<Buffer>((resolve, reject) => {
        ffmpeg.input(data)
          .audioCodec('pcm_s16le')
          .format('wav')
          .on('data', (chunk: Buffer) => {
            resolve(chunk);
          })
          .on('error', (error: Error) => {
            reject(error);
          })
          .pipe();
      });

      audioHandler(socket, convertedAudio);
    } catch (error) {
      console.error(`Error processing audio: ${(error as Error).message}`);
      socket.emit('transcriptionError', { message: 'Error processing audio' });
    }
  });

  socket.on('stopTranscription', () => {
    stopTranscriptionHandler(socket);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
};

export default audioConversion;
