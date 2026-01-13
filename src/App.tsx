import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  CheckCircle2, Circle, Pencil, Trash2, 
  Plus, Clock, LayoutList, Target, AlertCircle 
} from 'lucide-react';

import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter, DialogDescription 
} from "./components/ui/dialog";
import { Progress } from './components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';

const API_URL = "http://localhost:3001/todos";

export default function TodoApp() {
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState("");
  const [editingTodo, setEditingTodo] = useState<any>(null);

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => (await axios.get(API_URL)).data
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => axios.post(API_URL, {
      title, 
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['todos'] }); 
      setNewTodo(""); 
    }
  });

  const updateMutation = useMutation({
    mutationFn: (todo: any) => axios.put(`${API_URL}/${todo.id}`, {
      ...todo, 
      updatedAt: new Date().toISOString()
    }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['todos'] }); 
      setEditingTodo(null); 
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
  });

  const completedCount = todos.filter((t: any) => t.isCompleted).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  const isInputInvalid = newTodo.length > 0 && (newTodo.length < 3 || newTodo.length > 25);
  const canSubmit = newTodo.length >= 3 && newTodo.length <= 25;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-slate-200 to-indigo-100 p-4 md:p-10 flex justify-center items-start font-sans antialiased">
      
      <Card className="w-full max-w-2xl border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] bg-white/80 backdrop-blur-xl overflow-hidden rounded-[2rem]">
        <CardHeader className="pb-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                <LayoutList className="w-7 h-7" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight">Daily Tasks</CardTitle>
            </div>
            <div className="text-[11px] font-bold bg-white/20 px-4 py-1.5 rounded-full border border-white/30 tracking-wider">
              {format(new Date(), 'EEEE, d MMM').toUpperCase()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium opacity-80 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Bajarilish darajasi
                </span>
                <span className="text-4xl font-black">{Math.round(progress)}%</span>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70 font-bold uppercase tracking-widest">Soni</p>
                <p className="text-xl font-black">{completedCount} / {todos.length}</p>
              </div>
            </div>
            <Progress value={progress} className="h-3 bg-indigo-950/20 border border-white/10" />
          </div>
        </CardHeader>

        <div className="px-8 py-8 bg-white/40 border-b border-slate-100">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <Input 
                  value={newTodo} 
                  onChange={(e) => setNewTodo(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && addMutation.mutate(newTodo)}
                  placeholder="Yangi vazifa qo'shing..." 
                  className={cn(
                    "h-14 bg-white border-slate-200 focus:ring-2 rounded-2xl transition-all pl-5 pr-12 text-base shadow-sm",
                    isInputInvalid ? "border-red-400 focus:ring-red-200 bg-red-50" : "focus:ring-indigo-500"
                  )}
                />
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-md",
                    isInputInvalid ? "text-red-500 bg-red-100" : "text-slate-400 bg-slate-100"
                  )}>
                    {newTodo.length}/25
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => canSubmit && addMutation.mutate(newTodo)}
                disabled={!canSubmit || addMutation.isPending}
                className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                <Plus className="w-6 h-6 sm:mr-2 text-white" />
                <span className="hidden sm:inline text-white font-bold">ADD</span>
              </Button>
            </div>
            
            <div className="h-5">
              {isInputInvalid && (
                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 ml-2 animate-in slide-in-from-left-2">
                  <AlertCircle className="w-3 h-3" />
                  {newTodo.length < 3 ? "Kamida 3 ta belgi!" : "Maksimal 25 ta belgi!"}
                </p>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : todos.length === 0 ? (
              <div className="text-center py-16 opacity-40 italic">Hali vazifalar yo'q...</div>
            ) : (
              todos.map((todo: any) => (
                <div 
                  key={todo.id} 
                  className={cn(
                    "group flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-300",
                    todo.isCompleted 
                      ? "bg-slate-50 border-slate-100" 
                      : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                  )}
                >
                  <div className="flex items-center gap-5 flex-1">
                    <button 
                      onClick={() => updateMutation.mutate({...todo, isCompleted: !todo.isCompleted})}
                      className="focus:outline-none"
                    >
                      {todo.isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-green-500 animate-in zoom-in" />
                      ) : (
                        <Circle className="w-7 h-7 text-slate-300 hover:text-indigo-400" />
                      )}
                    </button>
                    
                    <div className="flex flex-col">
                      <p className={cn(
                        "font-bold text-slate-700 transition-all",
                        todo.isCompleted && "line-through text-slate-400"
                      )}>
                        {todo.title}
                      </p>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                        <Clock className="w-3 h-3" /> {format(new Date(todo.createdAt), 'HH:mm • d MMM')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setEditingTodo(todo)} className="h-10 w-10 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"><Pencil size={18}/></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(todo.id)} className="h-10 w-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={18}/></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800">Tahrirlash</DialogTitle>
            <DialogDescription className="font-medium text-slate-400">Vazifa nomini o'zgartiring.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input 
              value={editingTodo?.title || ""} 
              onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})} 
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-indigo-500 font-bold"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setEditingTodo(null)}>BEKOR QILISH</Button>
            <Button 
              disabled={!editingTodo?.title || editingTodo?.title.length < 3 || editingTodo?.title.length > 25}
              className="flex-1 rounded-2xl h-12 bg-indigo-600 hover:bg-indigo-700 font-bold" 
              onClick={() => updateMutation.mutate(editingTodo)}
            >
              SAQLASH
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}