package com.findback.repository;

import com.findback.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    List<LostItem> findByUserId(Long userId);
    List<LostItem> findByStatus(LostItem.LostStatus status);
}
