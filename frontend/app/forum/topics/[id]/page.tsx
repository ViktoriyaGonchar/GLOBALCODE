'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumApi, ForumTopic, ForumPost } from '@/lib/api/forum';
import { PostCard } from '@/components/forum/PostCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatRelativeTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicResponse, postsResponse] = await Promise.all([
          forumApi.getTopic(params.id as string),
          forumApi.getPosts(params.id as string),
        ]);

        if (topicResponse.success && topicResponse.data) {
          setTopic(topicResponse.data);
        }

        if (postsResponse.success && postsResponse.data) {
          setPosts(postsResponse.data.posts);
        }
      } catch (err) {
        console.error('Error fetching topic:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !postContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await forumApi.createPost(params.id as string, {
        content: postContent,
        parentId: replyingTo || undefined,
      });

      if (response.success && response.data) {
        setPostContent('');
        setReplyingTo(null);
        // Обновляем список сообщений
        const postsResponse = await forumApi.getPosts(params.id as string);
        if (postsResponse.success && postsResponse.data) {
          setPosts(postsResponse.data.posts);
        }
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка темы...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Тема не найдена</p>
          <Link href="/forum">
            <Button>Вернуться к форуму</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated && user?.id === topic.authorId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/forum">
          <Button variant="ghost">← Назад к форуму</Button>
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {topic.isPinned && <span className="text-yellow-500">📌</span>}
              {topic.isLocked && <span className="text-muted-foreground">🔒</span>}
              <h1 className="text-3xl font-bold">{topic.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>by {topic.author.username}</span>
              <span>•</span>
              <span>{formatRelativeTime(topic.createdAt)}</span>
              <span>•</span>
              <span>{topic.category.name}</span>
            </div>
          </div>
          {isAuthor && (
            <Link href={`/forum/topics/${topic.id}/edit`}>
              <Button variant="outline">Редактировать</Button>
            </Link>
          )}
        </div>

        <div className="prose max-w-none mb-4">
          <p className="whitespace-pre-wrap">{topic.content}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>💬 {topic._count.posts} ответов</span>
          <span>👁️ {topic.views} просмотров</span>
          <span>👍 {topic.likes}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="text-2xl font-semibold">Ответы ({posts.length})</h2>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReply={setReplyingTo}
            onUpdate={async () => {
              const response = await forumApi.getPosts(params.id as string);
              if (response.success && response.data) {
                setPosts(response.data.posts);
              }
            }}
          />
        ))}
      </div>

      {!topic.isLocked && isAuthenticated && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            {replyingTo ? 'Ответить на сообщение' : 'Добавить ответ'}
          </h3>
          {replyingTo && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                Отменить ответ
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmitPost}>
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Напишите ваш ответ..."
              rows={6}
              className="mb-4"
            />
            <Button type="submit" disabled={submitting || !postContent.trim()}>
              {submitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </form>
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-muted border rounded-lg p-6 text-center">
          <p className="mb-4">Войдите, чтобы оставить ответ</p>
          <Link href="/auth/login">
            <Button>Войти</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

