/* ========================================
   Creata - Feed View (posts de creadores suscritos)
   ======================================== */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rss, AlertCircle, Compass } from 'lucide-react';
import { PostCard } from '../components/posts/PostCard';
import { Card, Button, SkeletonFeed } from '../components/ui';
import { useFeedPosts } from '../hooks';
import type { Post } from '../types';
import './Feed.css';

const PAGE_SIZE = 5;

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useFeedPosts({ page, limit: PAGE_SIZE });

  // Acumula los posts de las páginas ya cargadas, evitando duplicados
  useEffect(() => {
    if (data?.data) {
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const fresh = data.data.filter((p) => !ids.has(p.id));
        return [...prev, ...fresh];
      });
    }
  }, [data]);

  const total = data?.pagination.total ?? posts.length;
  const hasMore = posts.length < total;
  const isEmpty = !isLoading && posts.length === 0 && total === 0;

  const handleLoadMore = () => setPage((p) => p + 1);

  return (
    <div className="page-container">
      <header className="feed__header">
        <h1 className="page-title">Tu Feed</h1>
        <p className="page-subtitle">
          Los posts más recientes de los creadores a los que estás suscrito.
        </p>
      </header>

      {isEmpty ? (
        <div className="feed__empty">
          <Card variant="glass" padding="lg" className="feed__empty-card">
            <Rss size={48} aria-hidden="true" className="feed__empty-icon" />
            <h2 className="feed__empty-title">Tu feed está vacío</h2>
            <p className="feed__empty-text">
              Suscríbete a creadores para ver aquí sus publicaciones premium y
              contenido exclusivo.
            </p>
            <Link to="/creators" className="btn btn--primary">
              <Compass size={18} />
              <span>Explorar creadores</span>
            </Link>
          </Card>
        </div>
      ) : isError && posts.length === 0 ? (
        <div className="feed__error">
          <Card variant="glass" padding="lg" className="feed__empty-card">
            <AlertCircle size={48} aria-hidden="true" className="feed__error-icon" />
            <h2 className="feed__empty-title">No se pudo cargar el feed</h2>
            <p className="feed__empty-text">Intenta de nuevo en unos momentos.</p>
          </Card>
        </div>
      ) : (
        <>
          {isLoading && posts.length === 0 ? (
            <SkeletonFeed count={3} />
          ) : (
            <div className="feed__posts">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} isSubscribed />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="feed__load-more">
              <Button
                variant="outline"
                size="md"
                onClick={handleLoadMore}
                isLoading={isFetching}
                disabled={isFetching}
              >
                Cargar más
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Feed;
