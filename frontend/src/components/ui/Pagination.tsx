/* ========================================
   Creata - Pagination Component
   ======================================== */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showTotal?: number;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showTotal,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
}: PaginationProps) {
  // Generate page numbers to display
  const pages = new Set<number>();

  // Always show first and last boundary pages
  for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
    pages.add(i);
  }
  for (let i = Math.max(totalPages - boundaryCount + 1, 1); i <= totalPages; i++) {
    pages.add(i);
  }

  // Show sibling pages around current page
  for (let i = Math.max(currentPage - siblingCount, 1); i <= Math.min(currentPage + siblingCount, totalPages); i++) {
    pages.add(i);
  }

  // Convert to sorted array
  const sortedPages = Array.from(pages).sort((a, b) => a - b);

  // Determine where to show ellipsis
  const pagesWithEllipsis: (number | 'ellipsis')[] = [];
  let prevPage = 0;

  for (const page of sortedPages) {
    if (prevPage > 0 && page - prevPage > 1) {
      pagesWithEllipsis.push('ellipsis');
    }
    pagesWithEllipsis.push(page);
    prevPage = page;
  }

  const handlePageChange = (page: number) => {
    if (!disabled && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <nav className="pagination" aria-label="Paginación">
      {showTotal && (
        <div className="pagination__info">
          Mostrando {Math.min((currentPage - 1) * 10 + 1, showTotal)}–{Math.min(currentPage * 10, showTotal)} de {showTotal} resultados
        </div>
      )}
      <ul className="pagination__list" role="list">
        {/* Previous button */}
        <li>
          <button
            className="pagination__button pagination__button--prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            aria-label="Página anterior"
            aria-disabled={disabled || currentPage === 1}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        </li>

        {/* Page numbers */}
        {pagesWithEllipsis.map((item, index) => (
          <li key={index}>
            {item === 'ellipsis' ? (
              <span className="pagination__ellipsis" aria-hidden="true">…</span>
            ) : (
              <button
                className={`pagination__button ${item === currentPage ? 'pagination__button--active' : ''}`}
                onClick={() => handlePageChange(item)}
                disabled={disabled}
                aria-label={`Página ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
              >
                {item}
              </button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li>
          <button
            className="pagination__button pagination__button--next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            aria-label="Página siguiente"
            aria-disabled={disabled || currentPage === totalPages}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}