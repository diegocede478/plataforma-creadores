/* ========================================
   Creata - Posts Manager View
   ======================================== */

import { useState, type FormEvent } from 'react';
import {
  FileText, Plus, Pencil, Trash2, Lock, Globe,
  DollarSign, Image, AlertTriangle
} from 'lucide-react';
import { useMyPosts, useCreatePost, useUpdatePost, useDeletePost } from '../hooks';
import { Button, Card, Badge, Input, Textarea, Modal, Pagination, SkeletonCard } from '../components/ui';
import type { Post } from '../types';
import './PostsManager.css';

interface PostFormState {
  content: string;
  mediaUrl: string;
  isPremium: boolean;
  price: string;
}

const EMPTY_FORM: PostFormState = {
  content: '',
  mediaUrl: '',
  isPremium: false,
  price: '',
};

export function PostsManager() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostFormState>(EMPTY_FORM);

  const { data, isLoading, isFetching } = useMyPosts({ page, limit });
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const posts = data?.data || [];
  const pagination = data?.pagination;

  const openCreateModal = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setForm({
      content: post.content,
      mediaUrl: post.mediaUrl || '',
      isPremium: post.isPremium,
      price: post.price ? String(post.price) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (createPost.isPending || updatePost.isPending) return;
    setModalOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      content: form.content.trim(),
      mediaUrl: form.mediaUrl.trim() || undefined,
      isPremium: form.isPremium,
      price: form.isPremium && form.price ? Number(form.price) : undefined,
    };

    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, data: payload }, {
        onSuccess: () => closeModal(),
      });
    } else {
      createPost.mutate(payload, {
        onSuccess: () => closeModal(),
      });
    }
  };

  const confirmDelete = () => {
    if (!deletingPost) return;
    deletePost.mutate(deletingPost.id, {
      onSuccess: () => setDeletingPost(null),
    });
  };

  const isSubmitting = createPost.isPending || updatePost.isPending;

  return (
    <div className="posts-manager">
      <div className="posts-manager__header">
        <div>
          <h2 className="posts-manager__title">Publicaciones</h2>
          <p className="posts-manager__subtitle">
            Gestiona el contenido que compartes con tus seguidores
          </p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Nueva publicación
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="posts-manager__grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card variant="glass" className="posts-manager__empty">
          <div className="posts-manager__empty-icon">
            <FileText size={48} />
          </div>
          <h3>Sin publicaciones</h3>
          <p>Crea tu primera publicación para empezar a compartir contenido con tus suscriptores.</p>
          <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
            Crear publicación
          </Button>
        </Card>
      ) : (
        <>
          <div className="posts-manager__grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={() => openEditModal(post)}
                onDelete={() => setDeletingPost(post)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="posts-manager__pagination">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                showTotal={pagination.total}
                disabled={isFetching}
              />
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPost ? 'Editar publicación' : 'Nueva publicación'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="posts-manager__form">
          <div className="posts-manager__form-group">
            <Textarea
              label="Contenido"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="¿Qué quieres compartir con tus seguidores?"
              rows={5}
              required
            />
          </div>

          <div className="posts-manager__form-group">
            <Input
              label="URL del contenido multimedia (opcional)"
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
              leftIcon={<Image size={16} />}
            />
          </div>

          <div className="posts-manager__form-toggle">
            <label className="posts-manager__switch">
              <input
                type="checkbox"
                checked={form.isPremium}
                onChange={(e) => setForm({ ...form, isPremium: e.target.checked, price: e.target.checked ? form.price : '' })}
              />
              <span className="posts-manager__switch-track">
                {form.isPremium ? <Lock size={14} /> : <Globe size={14} />}
              </span>
            </label>
            <div>
              <p className="posts-manager__form-toggle-title">
                {form.isPremium ? 'Contenido premium' : 'Contenido público'}
              </p>
              <p className="posts-manager__form-toggle-desc">
                {form.isPremium
                  ? 'Solo tus suscriptores podrán ver este contenido'
                  : 'Cualquier persona podrá ver esta publicación'}
              </p>
            </div>
          </div>

          {form.isPremium && (
            <div className="posts-manager__form-group">
              <Input
                label="Precio de desbloqueo (USD)"
                type="number"
                min="0.5"
                step="0.5"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="5.00"
                leftIcon={<DollarSign size={16} />}
                required={form.isPremium}
              />
              <p className="posts-manager__form-hint">
                Monto adicional para fans no suscritos que quieran desbloquear este post.
              </p>
            </div>
          )}

          <div className="posts-manager__form-actions">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !form.content.trim()} leftIcon={<Plus size={16} />}>
              {isSubmitting ? 'Guardando...' : editingPost ? 'Guardar cambios' : 'Publicar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingPost}
        onClose={() => !deletePost.isPending && setDeletingPost(null)}
        title="Eliminar publicación"
        size="sm"
      >
        <div className="posts-manager__confirm">
          <div className="posts-manager__confirm-icon">
            <AlertTriangle size={32} />
          </div>
          <p className="posts-manager__confirm-text">
            ¿Estás seguro de que quieres eliminar esta publicación?
            Esta acción no se puede deshacer.
          </p>
          <div className="posts-manager__confirm-actions">
            <Button
              variant="ghost"
              onClick={() => setDeletingPost(null)}
              disabled={deletePost.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deletePost.isPending}
              leftIcon={<Trash2 size={16} />}
            >
              {deletePost.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Post Card Component
interface PostCardProps {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
}

function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card variant="glass" className="post-card">
      <div className="post-card__header">
        {post.isPremium ? (
          <Badge variant="premium" size="sm" className="post-card__badge">
            <Lock size={12} /> Premium
          </Badge>
        ) : (
          <Badge variant="secondary" size="sm" className="post-card__badge">
            <Globe size={12} /> Público
          </Badge>
        )}
        <span className="post-card__date">{formattedDate}</span>
      </div>

      <p className="post-card__content">
        {post.content.length > 160 ? `${post.content.slice(0, 160)}...` : post.content}
      </p>

      {post.mediaUrl && (
        <div className="post-card__media">
          {post.mediaUrl.match(/\.(jpe?g|png|gif|webp)(\?.*)?$/i) ? (
            <img src={post.mediaUrl} alt="Contenido de la publicación" loading="lazy" />
          ) : (
            <div className="post-card__media-link">
              <Image size={20} />
              <span className="post-card__media-url">{post.mediaUrl}</span>
            </div>
          )}
        </div>
      )}

      <div className="post-card__footer">
        {post.isPremium && post.price > 0 && (
          <span className="post-card__price">
            <DollarSign size={14} /> {post.price.toFixed(2)}
          </span>
        )}
        <div className="post-card__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label="Editar publicación"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label="Eliminar publicación"
            className="post-card__delete"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default PostsManager;
