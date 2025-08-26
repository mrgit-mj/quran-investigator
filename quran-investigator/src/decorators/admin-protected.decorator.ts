import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

export function AdminProtected() {
  return applyDecorators(
    UseGuards(ApiKeyGuard),
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-api-key',
      description: 'Admin API key',
      required: true,
    }),
  );
}
