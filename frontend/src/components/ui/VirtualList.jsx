import React, { useState, useEffect, useMemo } from 'react';

/**
 * Componente de lista virtualizada para performance com grandes datasets
 */
const VirtualList = ({
  items,
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const containerScrollTop = scrollTop;
    const startIndex = Math.max(0, Math.floor(containerScrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((containerScrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        top: i * itemHeight
      });
    }

    return visibleItems;
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      data-testid="virtual-list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              height: itemHeight,
              width: '100%'
            }}
            data-testid={`virtual-item-${index}`}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;