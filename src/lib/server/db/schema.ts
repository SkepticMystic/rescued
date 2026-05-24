import * as AnimalModels from "./models/animal.model";
import * as AuthModels from "./models/auth.model";
import * as ImageModels from "./models/image.model";
import * as PostgisModels from "./models/postgis.model";
import * as ShelterModels from "./models/shelter.model";
import * as SubscriptionModels from "./models/subscription.model";
import * as TaskModels from "./models/task.model";

const {
  AccountTable,
  InvitationTable,
  MemberTable,
  OrganizationTable,
  PasskeyTable,
  SessionTable,
  UserTable,
  VerificationTable,
  TwoFactorTable,
  APIKeyTable,

  InvitationSchema: _InvitationSchema,
  OrganizationSchema: _OrganizationSchema,

  ...auth_rest
} = AuthModels;

const { SubscriptionTable, PaystackTransactionTable, ...subscription_rest } = SubscriptionModels;

const { ImageTable, ...image_rest } = ImageModels;

const { TaskTable, TaskSchema: _TaskSchema, ...task_rest } = TaskModels;

const { AnimalTable, AnimalSchema: _AnimalSchema, ...animal_rest } = AnimalModels;

const { ShelterTable, ShelterSchema: _ShelterSchema, ...shelter_rest } = ShelterModels;

const { spatialRefSys, geographyColumns, geometryColumns } = PostgisModels;

export const schema = {
  // Auth
  user: UserTable,
  account: AccountTable,
  session: SessionTable,
  verification: VerificationTable,
  organization: OrganizationTable,
  member: MemberTable,
  invitation: InvitationTable,
  passkey: PasskeyTable,
  twoFactor: TwoFactorTable,
  apikey: APIKeyTable,
  ...auth_rest,

  // Subscription
  subscription: SubscriptionTable,
  paystack_transaction: PaystackTransactionTable,
  ...subscription_rest,

  // Image
  image: ImageTable,
  ...image_rest,

  // Task
  task: TaskTable,
  ...task_rest,

  // Animal
  animal: AnimalTable,
  ...animal_rest,

  // Shelter
  shelter: ShelterTable,
  ...shelter_rest,

  // Postgis (introspection bindings — not exposed via db.query)
  spatial_ref_sys: spatialRefSys,
  geography_columns: geographyColumns,
  geometry_columns: geometryColumns,
};
