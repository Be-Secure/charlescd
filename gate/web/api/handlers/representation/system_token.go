package representation

import (
	"github.com/ZupIT/charlescd/gate/internal/domain"
	"github.com/google/uuid"
	"time"
)

type SystemTokenRequest struct {
	Name        string   `json:"name" validate:"required,notblank"`
	Permissions []string `json:"permissions" validate:"required,notnull"`
	Author      string   `json:"author" validate:"required,notblank"`
}

type SystemTokenResponse struct {
	ID          uuid.UUID            `json:"id"`
	Name        string               `json:"name"`
	Permissions []PermissionResponse `json:"permissions"`
	CreatedAt   *time.Time           `json:"created_at"`
	RevokedAt   *time.Time           `json:"revoked_at,omitempty"`
	LastUsedAt  *time.Time           `json:"last_used_atm,omitempty"`
	Author      string               `json:"author"`
}

type PageSystemTokenResponse struct {
	Content    []SystemTokenResponse `json:"content"`
	Page       int                   `json:"page"`
	Size       int                   `json:"size"`
	Last       bool                  `json:"last"`
	TotalPages int                   ` json:"totalPages"`
}

func (systemTokenRequest SystemTokenRequest) RequestToDomain(author string) domain.SystemToken {
	createdAt := time.Now()
	return domain.SystemToken{
		ID:          uuid.New(),
		Name:        systemTokenRequest.Name,
		Revoked:     false,
		Permissions: []domain.Permission{},
		CreatedAt:   &createdAt,
		RevokedAt:   &time.Time{},
		LastUsedAt:  &time.Time{},
		AuthorEmail: author,
	}
}

func SystemTokenToResponse(systemToken domain.SystemToken) SystemTokenResponse {
	return SystemTokenResponse{
		ID:          systemToken.ID,
		Name:        systemToken.Name,
		Permissions: PermissionsToResponse(systemToken.Permissions),
		CreatedAt:   systemToken.CreatedAt,
		RevokedAt:   systemToken.RevokedAt,
		LastUsedAt:  systemToken.LastUsedAt,
		Author:      systemToken.AuthorEmail,
	}
}

func SystemTokensToResponse(systemTokens []domain.SystemToken) []SystemTokenResponse {
	var systemTokenResponse []SystemTokenResponse
	for _, permission := range systemTokens {
		systemTokenResponse = append(systemTokenResponse, SystemTokenToResponse(permission))
	}
	return systemTokenResponse
}

func SystemTokenToPageResponse(systemToken []domain.SystemToken, page domain.Page) PageSystemTokenResponse {
	return PageSystemTokenResponse{
		Content:    SystemTokensToResponse(systemToken),
		Page:       page.PageNumber,
		Size:       page.PageSize,
		Last:       page.IsLast(),
		TotalPages: page.TotalPages(),
	}
}
