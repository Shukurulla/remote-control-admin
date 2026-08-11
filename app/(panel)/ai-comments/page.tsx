'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { socket } from '@/lib/socket';
import { Loader2, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';

interface ProgressStep {
  step: string;
  message: string;
  timestamp: Date;
}

interface DeviceProgress {
  deviceId: string;
  deviceName: string;
  currentStep: string;
  message: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  progress: number;
  generatedComment?: string;
  actualComment?: string;
  history: ProgressStep[];
}

const STEPS = [
  { key: 'received', label: 'Buyruq keldi', progress: 10 },
  { key: 'opening_app', label: 'Instagram ochilmoqda', progress: 25 },
  { key: 'app_opened', label: 'Instagram ochildi', progress: 40 },
  { key: 'opening_comment', label: 'Comment ochilmoqda', progress: 55 },
  { key: 'comment_opened', label: 'Comment ochildi', progress: 70 },
  { key: 'typing', label: 'Yozilmoqda', progress: 85 },
  { key: 'posting', label: 'Yuborilmoqda', progress: 95 },
  { key: 'completed', label: 'Muvaffaqiyatli', progress: 100 },
  { key: 'failed', label: 'Xatolik', progress: 0 },
];

export default function AICommentsPage() {
  const [postUrl, setPostUrl] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceProgress, setDeviceProgress] = useState<Map<string, DeviceProgress>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    fetchDevices();

    // Socket listeners
    socket.on('command_progress', handleProgressUpdate);
    socket.on('command_result', handleCommandResult);

    return () => {
      socket.off('command_progress', handleProgressUpdate);
      socket.off('command_result', handleCommandResult);
    };
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/devices', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setDevices(data.filter((d: any) => d.isOnline));
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleProgressUpdate = (data: any) => {
    const { deviceId, step, message, timestamp } = data;

    setDeviceProgress(prev => {
      const updated = new Map(prev);
      const current = updated.get(deviceId) || {
        deviceId,
        deviceName: devices.find(d => d.deviceId === deviceId)?.deviceName || deviceId,
        currentStep: step,
        message,
        status: 'executing',
        progress: 0,
        history: []
      };

      const stepData = STEPS.find(s => s.key === step);

      updated.set(deviceId, {
        ...current,
        currentStep: step,
        message,
        progress: stepData?.progress || current.progress,
        status: step === 'completed' ? 'completed' : step === 'failed' ? 'failed' : 'executing',
        history: [...current.history, { step, message, timestamp: new Date(timestamp) }]
      });

      return updated;
    });
  };

  const handleCommandResult = (data: any) => {
    const { deviceId, status, actualComment, generatedComment } = data;

    setDeviceProgress(prev => {
      const updated = new Map(prev);
      const current = updated.get(deviceId);

      if (current) {
        updated.set(deviceId, {
          ...current,
          status: status as any,
          actualComment,
          generatedComment
        });
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!postUrl || !postDescription || selectedDevices.length === 0) {
      toast({
        title: 'Xatolik',
        description: 'Barcha maydonlarni to\'ldiring va kamida bitta qurilma tanlang',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setDeviceProgress(new Map()); // Clear previous progress

    try {
      const res = await fetch('http://localhost:3003/api/commands/ai-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          postUrl,
          postDescription,
          deviceIds: selectedDevices,
          tone: 'positive',
          lang: 'uz'
        })
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Muvaffaqiyat',
          description: `${selectedDevices.length} ta qurilmaga buyruq yuborildi`
        });

        // Initialize progress for each device
        selectedDevices.forEach(deviceId => {
          const device = devices.find(d => d.deviceId === deviceId);
          const result = data.results.find((r: any) => r.deviceId === deviceId);

          setDeviceProgress(prev => {
            const updated = new Map(prev);
            updated.set(deviceId, {
              deviceId,
              deviceName: device?.deviceName || deviceId,
              currentStep: 'received',
              message: 'Buyruq yuborildi',
              status: 'pending',
              progress: 0,
              generatedComment: result?.comment,
              history: []
            });
            return updated;
          });
        });
      }
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Buyruq yuborishda xatolik',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (status: string, currentStep: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === 'executing') return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Comment Generator</h1>
        <p className="text-muted-foreground">Instagram postlarga AI yordamida comment joylash</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yangi Vazifa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Post URL</label>
            <Input
              placeholder="https://www.instagram.com/p/..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Post Tavsifi</label>
            <Textarea
              placeholder="Bu post haqida qisqacha yozing..."
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Qurilmalar ({devices.length} online)</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {devices.map(device => (
                <div
                  key={device.deviceId}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedDevices.includes(device.deviceId)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedDevices(prev =>
                      prev.includes(device.deviceId)
                        ? prev.filter(id => id !== device.deviceId)
                        : [...prev, device.deviceId]
                    );
                  }}
                >
                  <div className="font-medium">{device.deviceName}</div>
                  <div className="text-xs text-gray-500">{device.brand} {device.model}</div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedDevices.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Buyruq Yuborish ({selectedDevices.length})
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Monitoring */}
      {deviceProgress.size > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Jarayon Monitoring</h2>

          {Array.from(deviceProgress.values()).map(progress => (
            <Card key={progress.deviceId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStepIcon(progress.status, progress.currentStep)}
                    <div>
                      <CardTitle className="text-lg">{progress.deviceName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{progress.message}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      progress.status === 'completed' ? 'default' :
                      progress.status === 'failed' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {progress.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress.progress} className="h-2" />

                {/* Steps Timeline */}
                <div className="space-y-2">
                  {STEPS.filter(s => s.key !== 'failed').map(step => {
                    const isCompleted = progress.history.some(h => h.step === step.key);
                    const isCurrent = progress.currentStep === step.key;

                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-3 p-2 rounded ${
                          isCurrent ? 'bg-blue-50' : isCompleted ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          isCurrent ? 'bg-blue-500 animate-pulse' :
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className={`text-sm ${
                          isCurrent ? 'font-medium' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Generated vs Actual Comment */}
                {progress.generatedComment && (
                  <div className="space-y-2 pt-4 border-t">
                    <div>
                      <span className="text-sm font-medium">AI Comment:</span>
                      <p className="text-sm text-gray-600 mt-1">{progress.generatedComment}</p>
                    </div>
                    {progress.actualComment && (
                      <div>
                        <span className="text-sm font-medium">Yozilgan Comment:</span>
                        <p className="text-sm text-gray-600 mt-1">{progress.actualComment}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
