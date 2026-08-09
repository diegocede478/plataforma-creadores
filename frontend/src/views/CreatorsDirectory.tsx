/* ========================================
   Creata - Creators Directory View
   ======================================== */

import { useState } from 'react';
import { Search, Users, ArrowUpDown } from 'lucide-react';
import { CreatorCard } from '../components/creators/CreatorCard';
import { Card, Pagination, Skeleton } from '../components/ui';
import { useSearchUsers, useDebounce } from '../hooks';
import './CreatorsDirectory.css';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'subscribers', label: 'Más suscriptores' },
  { value: 'recent', label: 'Más recientes' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export function CreatorsDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortValue>('subscribers');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data, isLoading } = useSearchUsers({
    q: debouncedQuery || undefined,
    role: 'creator',
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const creators = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value as SortValue);
    setPage(1);
  };

  return (
    <div className="page-container">
      <header className="creators-directory__header">
        <h1 className="page-title">Creadores</h1>
        <p className="page-subtitle">
          Descubre y apoya a los creadores de la plataforma. Encuentra contenido
          exclusivo, suscríbete y encarga servicios personalizados.
        </p>
      </header>

      <div className="creators-directory__toolbar">
        <div className="creators-directory__search">
          <Search size={18} aria-hidden="true" className="creators-directory__search-icon" />
          <input
            type="search"
            className="creators-directory__search-input"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre o biografía..."
            aria-label="Buscar creadores"
          />
        </div>

        <div className="creators-directory__sort">
          <ArrowUpDown size={16} aria-hidden="true" className="creators-directory__sort-icon" />
          <select
            className="creators-directory__sort-select"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Ordenar creadores"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid--auto" role="status" aria-label="Cargando creadores">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="creators-directory__skeleton" key={i}>
              <Skeleton variant="rect" width="100%" height={160} />
              <div className="creators-directory__skeleton-body">
                <Skeleton variant="circle" width={64} height={64} />
                <Skeleton width="60%" height={18} />
                <Skeleton width="90%" height={12} />
                <Skeleton width="70%" height={12} />
              </div>
            </div>
          ))}
        </div>
      ) : creators.length > 0 ? (
        <>
          <p className="creators-directory__count">
            {total} {total === 1 ? 'creador encontrado' : 'creadores encontrados'}
          </p>
          <div className="grid grid--auto">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} user={creator} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="creators-directory__pagination">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                disabled={isLoading}
              />
            </div>
          )}
        </>
      ) : (
        <div className="creators-directory__empty">
          <Card variant="glass" padding="lg" className="creators-directory__empty-card">
            <Users size={48} aria-hidden="true" className="creators-directory__empty-icon" />
            <h2 className="creators-directory__empty-title">
              {searchQuery ? 'Sin resultados' : 'No hay creadores aún'}
            </h2>
            <p className="creators-directory__empty-text">
              {searchQuery
                ? `No encontramos creadores que coincidan con "${searchQuery}".`
                : 'Sé el primero en unirte y crear contenido exclusivo.'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CreatorsDirectory;
