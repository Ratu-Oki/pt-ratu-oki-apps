import React, { useCallback, useMemo } from 'react';
import {
  Card,
  Checkbox,
  InputNumber,
  Space,
  Divider,
  Row,
  Col,
} from 'antd';
import styles from './Sidebar.module.css';

/**
 * Sidebar Filter Component
 * Filter untuk Grade, Harga, dan Berat
 */
const Sidebar = ({ onFilterChange = () => {} }) => {
  const [filters, setFilters] = React.useState({
    grades: ['Grade A (Premium)'],
    priceRange: { min: 0, max: 100000000 },
    weights: ['1 kg'],
  });

  const grades = [
    'Grade A (Premium)',
    'Grade B (Standard)',
    'Grade C (Extract)',
    'Grade D',
  ];

  const weights = ['100 gram', '250 gram', '500 gram', '1 kg'];

  // Handle grade checkbox change
  const handleGradeChange = useCallback((grade) => {
    setFilters((prev) => {
      const newGrades = prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade];

      const updatedFilters = { ...prev, grades: newGrades };
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  }, [onFilterChange]);

  // Handle weight checkbox change
  const handleWeightChange = useCallback((weight) => {
    setFilters((prev) => {
      const newWeights = prev.weights.includes(weight)
        ? prev.weights.filter((w) => w !== weight)
        : [...prev.weights, weight];

      const updatedFilters = { ...prev, weights: newWeights };
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  }, [onFilterChange]);

  // Handle price range change
  const handlePriceChange = useCallback((field, value) => {
    setFilters((prev) => {
      const newRange = { ...prev.priceRange, [field]: value || 0 };
      const updatedFilters = { ...prev, priceRange: newRange };
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  }, [onFilterChange]);

  return (
    <Card className={styles.sidebar}>
      {/* Grade Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Grade</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          {grades.map((grade) => (
            <Checkbox
              key={grade}
              checked={filters.grades.includes(grade)}
              onChange={() => handleGradeChange(grade)}
            >
              {grade}
            </Checkbox>
          ))}
        </Space>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Price Range Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Harga</h3>
        <Row gutter={8}>
          <Col flex="auto">
            <InputNumber
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(val) => handlePriceChange('min', val)}
              className={styles.priceInput}
              min={0}
              step={100000}
            />
          </Col>
          <Col style={{ display: 'flex', alignItems: 'center' }}>
            <span>-</span>
          </Col>
          <Col flex="auto">
            <InputNumber
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(val) => handlePriceChange('max', val)}
              className={styles.priceInput}
              min={0}
              step={100000}
            />
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Weight Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Berat</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          {weights.map((weight) => (
            <Checkbox
              key={weight}
              checked={filters.weights.includes(weight)}
              onChange={() => handleWeightChange(weight)}
            >
              {weight}
            </Checkbox>
          ))}
        </Space>
      </div>
    </Card>
  );
};

export default Sidebar;
