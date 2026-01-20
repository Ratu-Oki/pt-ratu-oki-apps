import React from 'react';
import styles from './RecentActivities.module.css';

const RecentActivities = ({ activities }) => {
  return (
    <div className={styles.activitiesContainer}>
      <h3 className={styles.activitiesTitle}>Aktivitas Terbaru</h3>
      <div className={styles.activitiesList}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              {activity.icon}
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>{activity.title}</p>
              <p className={styles.activityTime}>{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
