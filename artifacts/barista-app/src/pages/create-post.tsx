import { useState } from 'react';
import { useLocation } from 'wouter';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useCreatePost } from '@workspace/api-client-react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TYPES = [
  { id: 'daily', label: '일상' },
  { id: 'recipe', label: '레시피' },
  { id: 'knowhow', label: '노하우' },
  { id: 'instagram', label: '인스타' }
] as const;

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [type, setType] = useState<typeof TYPES[number]['id']>('daily');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const createMutation = useCreatePost();

  const handleSubmit = async () => {
    if (!content) {
      toast({ title: '내용 입력', description: '게시글 내용을 입력해주세요.', variant: 'destructive' });
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: { type, title, content }
      });
      toast({ title: '작성 완료', description: '게시글이 등록되었습니다.' });
      setLocation('/community');
    } catch (e) {
      toast({ title: '작성 실패', description: '다시 시도해주세요.', variant: 'destructive' });
    }
  };

  return (
    <MobileLayout hideNav backTo="/community" title="글쓰기" bgCream>
      <div className="p-4 flex flex-col h-full gap-4">
        
        {/* Category Select */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                type === t.id 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-transparent bg-white text-muted-foreground shadow-sm'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-border p-4 flex flex-col gap-4">
          <input
            type="text"
            placeholder="제목을 입력하세요 (선택)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-bold border-b border-border pb-4 outline-none placeholder:text-muted-foreground/60"
          />
          
          <textarea
            placeholder="바리스타들과 나누고 싶은 이야기를 적어주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 resize-none outline-none text-base leading-relaxed placeholder:text-muted-foreground/60"
          />

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <button className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-stone-200 transition-colors">
              <ImagePlus className="w-6 h-6" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !content}
              className="px-8 py-3.5 bg-foreground text-white font-bold rounded-xl shadow-lg shadow-foreground/20 hover:bg-foreground/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : '등록하기'}
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
