package com.findback.repository;

import com.findback.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReporterId(Long reporterId);
    List<Report> findByTargetTypeAndTargetId(Report.TargetType targetType, Long targetId);
    List<Report> findByStatus(Report.ReportStatus status);
}
