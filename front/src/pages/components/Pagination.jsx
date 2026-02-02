import React from 'react';
import ReactPaginate from 'react-paginate'; // Если хотите готовую библиотеку
// ИЛИ напишем свой простой (рекомендую свой для обучения, но код ниже универсальный)

import '../../SCSS/components/pagination.scss'; // Создайте этот файл стилей

const Pagination = ({ currentPage, totalPages, onChangePage }) => {
  if (totalPages <= 1) return null; // Если страница всего одна, пагинация не нужна

  // Создаем массив номеров страниц [1, 2, 3...]
  const pages = [...Array(totalPages)].map((_, i) => i + 1);

  return (
    <div className="pagination">
      <button 
        disabled={currentPage === 1} 
        onClick={() => onChangePage(currentPage - 1)}
        className="pagination__btn"
      >
        &lt;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onChangePage(page)}
          className={`pagination__num ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}

      <button 
        disabled={currentPage === totalPages} 
        onClick={() => onChangePage(currentPage + 1)}
        className="pagination__btn"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;