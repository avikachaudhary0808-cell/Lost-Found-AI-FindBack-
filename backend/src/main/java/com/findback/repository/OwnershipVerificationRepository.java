package com.findback.repository;

import com.findback.entity.OwnershipVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OwnershipVerificationRepository extends JpaRepository<OwnershipVerification, Long> {
    Optional<OwnershipVerification> findByItemMatchId(Long itemMatchId);
}
