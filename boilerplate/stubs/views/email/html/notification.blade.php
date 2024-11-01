@extends('flarum.forum::email.html.notification.base')

@section('notificationContent')
<% if (!content) { %>   <!-- Required content -->
<% } else { %>  <%- content %><% } %>
@endsection

{{--@section('contentPreview')--}}
{{--    <!-- Optional content -->--}}
{{--@endsection--}}
