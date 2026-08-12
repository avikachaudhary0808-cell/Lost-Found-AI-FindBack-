package com.findback.repository;

import com.findback.entity.ItemMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemMatchRepository extends JpaRepository<ItemMatch, Long> {
    List<ItemMatch> findByLostItemId(Long lostItemId);
    List<ItemMatch> findByFoundItemId(Long foundItemId);

    @Query("SELECT m FROM ItemMatch m WHERE m.lostItem.id = :lostItemId AND m.foundItem.id = :foundItemId")
    Optional<ItemMatch> findByLostItemIdAndFoundItemId(@Param("lostItemId") Long lostItemId, @Param("foundItemId") Long foundItemId);
}
