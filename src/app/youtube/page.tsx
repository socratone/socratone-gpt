'use client';

import React, { useEffect, useRef, useState } from 'react';
import AnimatedButton from '@/components/AnimatedButton';
import EllipsisLoader from '@/components/EllipsisLoader';
import Select from '@/components/Select';
import TextInput from '@/components/TextInput';
import { ASR_MODEL_STORAGE_KEY, FLASK_API_URL } from '@/constants';
import { modelOptions } from './constants';
import { AsrModel } from '@/types';
import Header from '@/components/Header';

const Youtube = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedModel, setSelectedModel] = useState<AsrModel>(
    'facebook/wav2vec2-base-960h'
  );
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');

  const [duration, setDuration] = useState(0);

  // model 값 불러오기
  useEffect(() => {
    const savedModel = localStorage.getItem(ASR_MODEL_STORAGE_KEY);
    if (typeof savedModel === 'string') {
      setSelectedModel(savedModel as AsrModel);
    }
  }, []);

  // 앱이 처음 로드될 때 알림 권한 요청
  useEffect(() => {
    if (
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('알림 권한이 승인되었습니다.');
        }
      });
    }
  }, []);

  const startTimer = () => {
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((duration) => duration + 1);
    }, 1000);
  };

  const endTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const showNotification = (message: string) => {
    if (Notification.permission === 'granted') {
      new Notification(message);
    }
  };

  const fetchTextFromYoutube = async () => {
    startTimer();
    setIsLoading(true);
    setIsError(false);
    setText('');

    try {
      const response = await fetch(`${FLASK_API_URL}/youtube-to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: youtubeUrl,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      setText(data?.original_text);
      setSummary(data?.summary);
    } catch (error) {
      setIsError(true);
      console.error('Error:', error);
    } finally {
      endTimer();
      setIsLoading(false);
      showNotification('해석이 완료되었습니다!');
    }
  };

  const handleModelChange = (selectedModel: string) => {
    localStorage.setItem(ASR_MODEL_STORAGE_KEY, selectedModel);
    setSelectedModel(selectedModel as AsrModel);
  };

  return (
    <div className="flex flex-col">
      <Header isHome />
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-center gap-2 flex-wrap">
          <Select
            value={selectedModel}
            options={modelOptions}
            onChange={handleModelChange}
            fullWidth
            maxWidth={300}
          />
          <TextInput
            placeholder="https://www.youtube.com/watch?v=example"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            fullWidth
            maxWidth={500}
            autoFocus
          />
          <AnimatedButton size="small" onClick={fetchTextFromYoutube}>
            Transcribe
          </AnimatedButton>
        </div>
        {duration !== 0 && <p>걸린 시간: {duration}초</p>}
        {isLoading ? (
          <div className="mx-auto">
            <EllipsisLoader />
          </div>
        ) : isError ? (
          <p className="p-2 text-red-500">에러가 발생했습니다.</p>
        ) : text ? (
          <>
            <h2 className="font-bold">요약</h2>
            <p>{summary}</p>
            <h2 className="font-bold">내용</h2>
            <p>{text}</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Youtube;
