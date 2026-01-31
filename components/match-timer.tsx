"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer, Bell, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MatchTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Função para criar beep usando Web Audio API
  const playBeep = useCallback((frequency: number = 800, duration: number = 200) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  // Função para tocar o alarme (sequência de beeps)
  const playAlarm = useCallback(() => {
    if (!soundEnabled) return;
    
    // Toca uma sequência de beeps
    const playSequence = () => {
      playBeep(800, 150);
      setTimeout(() => playBeep(1000, 150), 200);
      setTimeout(() => playBeep(800, 150), 400);
    };
    
    // Toca imediatamente
    playSequence();
    
    // Repete a cada 1.5 segundos
    alarmIntervalRef.current = setInterval(playSequence, 1500);
  }, [soundEnabled, playBeep]);

  // Função para parar o alarme
  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAlarm();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAlarm]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, playAlarm]);

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsFinished(false);
    stopAlarm();
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    stopAlarm();
    setTimeLeft(minutes * 60 + seconds);
  };

  const handleSetTime = () => {
    setIsRunning(false);
    setIsFinished(false);
    stopAlarm();
    setTimeLeft(minutes * 60 + seconds);
  };

  const handleDismissAlert = () => {
    setIsFinished(false);
    stopAlarm();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((minutes * 60 + seconds - timeLeft) / (minutes * 60 + seconds)) * 100;

  return (
    <>
      {/* Alerta de tempo esgotado */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="w-[90%] max-w-md border-2 border-amber-500 animate-pulse">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <Bell className="w-16 h-16 text-amber-500 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-amber-500">Tempo Esgotado!</h2>
              <p className="text-muted-foreground">O tempo da partida acabou</p>
              <Button onClick={handleDismissAlert} size="lg" className="w-full">
                OK, Entendi
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão de atalho flutuante */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg border-2 border-primary bg-card hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Timer className="h-6 w-6" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Cronômetro da Partida
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Display do tempo */}
            <div className="text-center">
              <div
                className={`text-6xl font-mono font-bold ${
                  timeLeft <= 60 && timeLeft > 0
                    ? "text-red-500 animate-pulse"
                    : timeLeft === 0
                    ? "text-red-500"
                    : "text-primary"
                }`}
              >
                {formatTime(timeLeft)}
              </div>

              {/* Barra de progresso */}
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Configuração de tempo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutos</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="90"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isRunning}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seconds">Segundos</Label>
                <Input
                  id="seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Botões de tempo predefinido */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[5, 7, 10, 15, 20].map((min) => (
                <Button
                  key={min}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinutes(min);
                    setSeconds(0);
                    setTimeLeft(min * 60);
                    setIsRunning(false);
                    setIsFinished(false);
                    stopAlarm();
                  }}
                  disabled={isRunning}
                >
                  {min} min
                </Button>
              ))}
            </div>

            {/* Controles */}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Desativar som" : "Ativar som"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              {!isRunning ? (
                <Button onClick={handleStart} size="lg" className="flex-1 max-w-[150px]">
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar
                </Button>
              ) : (
                <Button onClick={handlePause} variant="secondary" size="lg" className="flex-1 max-w-[150px]">
                  <Pause className="mr-2 h-5 w-5" />
                  Pausar
                </Button>
              )}

              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reiniciar
              </Button>
            </div>

            {!isRunning && timeLeft !== minutes * 60 + seconds && (
              <Button onClick={handleSetTime} variant="ghost" size="sm" className="w-full">
                Definir novo tempo
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
