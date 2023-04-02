import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { Role } from "../enums/users.role";
import { includes } from "lodash";

@Injectable()
export class UsersRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>("roles",[
      context.getHandler(),
      context.getClass()
    ])
    if(!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if(!user) {
      throw new UnauthorizedException()
    }
    return includes(requiredRoles, user.role)
  }
}